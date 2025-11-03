import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';

export const TransactionList: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage all transactions</p>
        </div>

        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600">
              Transactions will appear here once your children start using their accounts
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
