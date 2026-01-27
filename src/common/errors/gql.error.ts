import { GraphQLError } from 'graphql';

export const gqlErrorHandler = (error: GraphQLError) => {
  const ext: any = error.extensions ?? {};
  const resp: any = ext.response; 
  const code = ext.code;
  const timestamp = new Date().toISOString();

  if (resp && typeof resp === 'object') {
   
    const { message, ...rest } = resp;

    return new GraphQLError(message ?? error.message, {
      extensions: {
        code,
        timestamp,
        ...rest,          
      },
    });
  }

  const { stacktrace, ...restExt } = ext;

  return new GraphQLError(error.message, {
    extensions: {
      ...restExt,
      code,
      timestamp,
    },
  });
};
