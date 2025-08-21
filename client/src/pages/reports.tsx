import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Reports</h2>
            <p className="text-sm text-gray-600 mt-1">View comprehensive business reports</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
            <p className="text-gray-600">Comprehensive reporting features will be available here.</p>
          </div>
        </div>
      </main>
    </>
  );
}
