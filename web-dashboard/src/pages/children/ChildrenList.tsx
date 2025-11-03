import React from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ChildrenList: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Children</h1>
            <p className="text-gray-600 mt-1">Manage your children's accounts</p>
          </div>
          <Button variant="primary">Add Child</Button>
        </div>

        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No children added yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first child to start managing their finances
            </p>
            <Button variant="primary">Add Your First Child</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
