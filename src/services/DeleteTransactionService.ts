// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const deleteTransaction = await transactionsRepository.findOne(id);
    if (!deleteTransaction) {
      throw new AppError('Transaction not found', 404);
    }
    transactionsRepository.remove(deleteTransaction);
  }
}

export default DeleteTransactionService;
