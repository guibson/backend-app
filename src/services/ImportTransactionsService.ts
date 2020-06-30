import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const transactionCreate = new CreateTransactionService();

    const rows: Request[] = [];
    const csvFile = path.resolve(uploadConfig.directory, fileName);
    const csvParser = fs.createReadStream(csvFile).pipe(
      csv({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      }),
    );

    csvParser.on('data', async transactionRow => {
      const [title, type, value, category] = transactionRow;
      // check if some header is valid
      rows.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      csvParser.on('end', resolve);
    });

    const arrayTransaction = [];
    for (const iterator of rows) {
      const resultTransaction = await transactionCreate.execute(iterator);
      arrayTransaction.push(resultTransaction);
    }
    return arrayTransaction;
  }
}

export default ImportTransactionsService;
