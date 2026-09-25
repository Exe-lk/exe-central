'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="w-full h-screen bg-white overflow-y-auto pt-8">
      {/* 
        The url prop points to the API route created in Step 3B. 
        SwaggerUI automatically fetches and parses the JSON specification.
      */}
      <SwaggerUI url="/api/swagger-docs" />
    </div>
  );
}