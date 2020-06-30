import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('This transaction is invalid.', 400);
    }

    const categoryRepository = getRepository(Category);
    let findCat = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!findCat) {
      findCat = categoryRepository.create({ title: category });
      await categoryRepository.save(findCat);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: findCat,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
