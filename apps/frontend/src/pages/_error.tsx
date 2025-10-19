import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        {statusCode
          ? `Si è verificato un errore ${statusCode}`
          : 'Si è verificato un errore sul client'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
