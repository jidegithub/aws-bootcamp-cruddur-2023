// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
// import { ZoneContextManager } from '@opentelemetry/context-zone';
// import { W3CTraceContextPropagator } from '@opentelemetry/core'
// import { Resource }  from '@opentelemetry/resources';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
// import { registerInstrumentations } from '@opentelemetry/instrumentation';

// For sending traces for all http requests
// import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
// import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
// import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';

// const exporter = new OTLPTraceExporter({
//   url: `${process.env.REACT_APP_FRONTEND_URL}:443/v1/traces`
//   // headers: {
//   //   "x-honeycomb-team": process.env.HONEYCOMB_API_KEY_FRONTEND,
//   // },
// });

// console.log(`Connecting to ${process.env.REACT_APP_FRONTEND_URL}/v1/traces collector`)

// const provider = new WebTracerProvider({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: 'cruddur-frontend-reactjs'
//   }),
// });

// provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// provider.register({
//   contextManager: new ZoneContextManager()
// });

// // Registering instrumentations / plugins
// registerInstrumentations({
//   instrumentations: [
//     new XMLHttpRequestInstrumentation({
//       propagateTraceHeaderCorsUrls: [
//         new RegExp(`${process.env.REACT_APP_BACKEND_URL}`, 'g')
//       ]
//     }),
//     new FetchInstrumentation({
//       propagateTraceHeaderCorsUrls: [
//         new RegExp(`${process.env.REACT_APP_BACKEND_URL}`, 'g')
//       ]
//     }),
//     new DocumentLoadInstrumentation(),
//   ],
// });


// const exporter = new OTLPTraceExporter({
//   url: `${process.env.REACT_APP_FRONTEND_URL}:443/v1/traces`
// })

// console.log(`Connecting to ${process.env.REACT_APP_FRONTEND_URL}/v1/traces collector`)

// const resource = new Resource({
//   [SemanticResourceAttributes.SERVICE_NAME]: 'cruddur-frontend',
// })

// const provider = new WebTracerProvider({ resource })
// provider.addSpanProcessor(new BatchSpanProcessor(exporter))

// // Initialize the provider
// provider.register({
//   propagator: new W3CTraceContextPropagator(),
//   contextManager: new ZoneContextManager(),
// })

// // Registering instrumentations / plugins
// registerInstrumentations({
//   instrumentations: [
//     new FetchInstrumentation({
//       propagateTraceHeaderCorsUrls: [/.+/g], // this is too broad for production
//       clearTimingResources: true,
//     })
//   ]
// })

import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Resource }  from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporter = new OTLPTraceExporter({
  url: `${process.env.REACT_APP_FRONTEND_URL}:443/v1/traces`,
});

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'cruddur-frontend-reactjs',
  })
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register({
  contextManager: new ZoneContextManager()
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation(),
    new HttpInstrumentation()
  ],
  tracerProvider: provider,
});
