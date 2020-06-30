import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    if (!fileName.endsWith('.csv')) {
      throw new AppError('This type of file is invalid.', 400);
    }
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const csvFilePath = path.resolve(uploadConfig.directory, fileName);
    const csvParser = fs.createReadStream(csvFilePath).pipe(
      csv({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      }),
    );

    const rowsCategory: string[] = [];
    const rowsTransaction: Request[] = [];
    csvParser.on('data', async lineCsv => {
      const [title, type, value, category] = lineCsv;
      // check if some header is valid
      rowsCategory.push(category);
      rowsTransaction.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      csvParser.on('end', resolve);
    });

    // do bulk insert
    const findCategoriesExist = await categoryRepository.find({
      where: { title: In(rowsCategory) },
    });

    const titleCategories = findCategoriesExist.map(
      (category: Category) => category.title,
    );
    const filterCategoriesToAdd = rowsCategory
      .filter(category => !titleCategories.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    const newCategories = categoryRepository.create(
      filterCategoriesToAdd.map(title => ({ title })),
    );
    await categoryRepository.save(newCategories);
    const resultCategories = [...newCategories, ...findCategoriesExist];

    // save transactions
    const createTransactionsByImport = transactionRepository.create(
      rowsTransaction.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: resultCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(createTransactionsByImport);
    await fs.promises.unlink(csvFilePath);
    return createTransactionsByImport;
  }
}

export default ImportTransactionsService;
