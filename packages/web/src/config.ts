export type Config = {
  apiHost: string;
}

const config = {
  apiHost: import.meta.env['VITE_API_HOST'] as string
}

export default config
