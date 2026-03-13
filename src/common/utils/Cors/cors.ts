export function corsOption() {
  const whiteList = process.env.WHITELIST_URLS?.split(',') || [];

  const corsOptions = {
    origin: function (
      origin: string,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (!origin) {
        return callback(null, true);
      }
      if (whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  };

  return corsOptions;
}
