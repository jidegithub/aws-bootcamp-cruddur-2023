import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { XMLHttpRequestInstrumentation } = require('@opentelemetry/instrumentation-xml-http-request')

const exporter = new OTLPTraceExporter({
  // url: `${process.env.REACT_APP_OTEL_COLLECTOR_ENDPOINT}/v1/traces`,
  url: `${process.env.REACT_APP_BACKEND_URL}/api/v1/traces`,
  headers: {
    "x-honeycomb-team": "h7GZS9kshozbtFTcrIuhUD",
  },
});

// console.log(`Connecting to ${process.env.REACT_APP_OTEL_COLLECTOR_ENDPOINT}/api/v1/traces collector`)
console.log(`Connecting to ${process.env.REACT_APP_BACKEND_URL}/api/v1/traces collector`)


const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'cruddur-frontend-reactjs',
  }),
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter))

provider.register({
  propagator: new W3CTraceContextPropagator(),
  contextManager: new ZoneContextManager()  // Zone is required to keep async calls in the same trace
});

const fetchInstrumentation = new FetchInstrumentation({
  // propagateTraceHeaderCorsUrls: [ `${process.env.REACT_APP_OTEL_COLLECTOR_ENDPOINT}` ], // this is too broad for production
  propagateTraceHeaderCorsUrls: [ `${process.env.REACT_APP_BACKEND_URL}/api/v1/traces` ],
  clearTimingResources: true,
});

const xMLHttpRequestInstrumentation = new XMLHttpRequestInstrumentation({
  // propagateTraceHeaderCorsUrls: [ `${process.env.REACT_APP_OTEL_COLLECTOR_ENDPOINT}` ],
  propagateTraceHeaderCorsUrls: [ `${process.env.REACT_APP_BACKEND_URL}/api/v1/traces` ],
  clearTimingResources: true,
});

const documentLoadInstrumentation = new DocumentLoadInstrumentation()

// fetchInstrumentation.setTracerProvider(provider);

// Registering instrumentations
registerInstrumentations({
  instrumentations: [
    documentLoadInstrumentation,
    fetchInstrumentation,
    xMLHttpRequestInstrumentation,
  ],
});

// export default function TraceProvider({ children }) {
//   return (
//     <>
//       {children}
//     </>
//   );
// }