import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = new URL(
    event.node.req.url as string,
    'http://localhost',
  );
  const path = url.pathname;

  if (runtimeConfig.nodeEnv !== 'local') {
    // Log detailed routing information
    console.log('Middleware Intercepted Route:', {
      fullUrl: url.toString(),
      pathname: path,
      method: event.node.req.method,
      headers: event.node.req.headers,
    });
  }
});
