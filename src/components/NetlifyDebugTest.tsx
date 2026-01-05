import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

// 🔧 Type Definitions - Cải thiện type safety
interface EnvironmentInfo {
  supabaseUrl: string;
  hasAnonKey: boolean;
  anonKeyLength: number;
  mode: string;
  dev: boolean;
  prod: boolean;
}

interface TestResult {
  success: boolean;
  error: string | null;
  latency?: string;
  count?: number;
  data?: any;
}

interface DatabaseTestResults {
  insert?: TestResult;
  select?: TestResult;
  cleanup?: TestResult;
}

interface DebugResults {
  timestamp: string;
  environment: EnvironmentInfo;
  supabaseTest: TestResult;
  databaseTest: DatabaseTestResults;
  error?: string;
}

/**
 * Component debug để test Supabase trên Netlify
 * Kiểm tra environment variables và kết nối database
 * 
 * @returns JSX.Element - Debug test interface
 */
export const NetlifyDebugTest = () => {
  const [debugInfo, setDebugInfo] = useState<DebugResults | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔧 Helper Functions - Tách logic thành các functions nhỏ hơn
  
  /**
   * Kiểm tra environment variables
   */
  const checkEnvironmentVariables = useCallback((): EnvironmentInfo => {
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    };
  }, []);

  /**
   * Test kết nối Supabase
   */
  const testSupabaseConnection = useCallback(async (): Promise<TestResult> => {
    try {
      const startTime = Date.now();
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('passwords')
        .select('count', { count: 'exact', head: true });

      const latency = Date.now() - startTime;

      return {
        success: !connectionError,
        latency: `${latency}ms`,
        error: connectionError?.message || null,
        count: connectionTest || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }, []);

  /**
   * Test database operations (CRUD)
   */
  const testDatabaseOperations = useCallback(async (): Promise<DatabaseTestResults> => {
    const results: DatabaseTestResults = {};
    
    try {
      // Test INSERT
      const testEntry = {
        service: `Netlify Test ${Date.now()}`,
        username: 'test@netlify.com',
        password: 'test123'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('passwords')
        .insert([testEntry])
        .select()
        .single();

      results.insert = {
        success: !insertError,
        error: insertError?.message || null,
        data: insertData?.id || null
      };

      // Test SELECT
      const { data: selectData, error: selectError } = await supabase
        .from('passwords')
        .select('*')
        .limit(5);

      results.select = {
        success: !selectError,
        error: selectError?.message || null,
        count: selectData?.length || 0
      };

      // Cleanup - DELETE test entry
      if (insertData?.id) {
        const { error: deleteError } = await supabase
          .from('passwords')
          .delete()
          .eq('id', insertData.id);

        results.cleanup = {
          success: !deleteError,
          error: deleteError?.message || null
        };
      }

    } catch (error) {
      results.insert = {
        success: false,
        error: error instanceof Error ? error.message : 'Database operation failed'
      };
    }

    return results;
  }, []);

  /**
   * Chạy tất cả debug tests
   */
  const runDebugTest = useCallback(async () => {
    setLoading(true);
    
    const results: DebugResults = {
      timestamp: new Date().toISOString(),
      environment: checkEnvironmentVariables(),
      supabaseTest: { success: false, error: null },
      databaseTest: {}
    };

    try {
      // Test Supabase connection
      results.supabaseTest = await testSupabaseConnection();
      
      // Test database operations nếu connection thành công
      if (results.supabaseTest.success) {
        results.databaseTest = await testDatabaseOperations();
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      setDebugInfo(results);
      setLoading(false);
    }
  }, [checkEnvironmentVariables, testSupabaseConnection, testDatabaseOperations]);

/**
 * Component hiển thị kết quả debug test
 */
const DebugResultsDisplay = ({ debugInfo }: { debugInfo: DebugResults }) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">🌍 Environment Variables</h3>
      <pre className="text-sm overflow-x-auto">
        {JSON.stringify(debugInfo.environment, null, 2)}
      </pre>
    </div>

    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">🔗 Supabase Connection</h3>
      <pre className="text-sm overflow-x-auto">
        {JSON.stringify(debugInfo.supabaseTest, null, 2)}
      </pre>
    </div>

    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">🗄️ Database Operations</h3>
      <pre className="text-sm overflow-x-auto">
        {JSON.stringify(debugInfo.databaseTest, null, 2)}
      </pre>
    </div>

    {debugInfo.error && (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">❌ Error</h3>
        <p className="text-red-600 dark:text-red-400 text-sm">{debugInfo.error}</p>
      </div>
    )}
  </div>
);

/**
 * Component hướng dẫn khắc phục
 */
const TroubleshootingGuide = () => (
  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Hướng dẫn khắc phục</h3>
    <ul className="text-blue-600 dark:text-blue-400 text-sm space-y-1">
      <li>1. Kiểm tra Environment Variables trong Netlify Dashboard</li>
      <li>2. Đảm bảo VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY được set</li>
      <li>3. Chạy SQL script setup_rls_policies.sql trong Supabase</li>
      <li>4. Redeploy site sau khi thay đổi env vars</li>
    </ul>
  </div>
);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Netlify Debug Test</CardTitle>
        <CardDescription>
          Kiểm tra cấu hình Supabase và kết nối database trên Netlify
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runDebugTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Đang test...' : 'Chạy Debug Test'}
        </Button>
        
        {debugInfo && <DebugResultsDisplay debugInfo={debugInfo} />}
        
        <TroubleshootingGuide />
      </CardContent>
    </Card>
  );
};