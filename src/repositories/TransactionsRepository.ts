import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const { income, outcome } = transactions.reduce(
      (acc: Balance, transaction: TransactionDTO) => {
        if (transaction.type === 'income') {
          acc.income += transaction.value;
        } else if (transaction.type === 'outcome') {
          acc.outcome += transaction.value;
        }
        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
