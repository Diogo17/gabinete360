import type { Config } from "tailwindcss";
import baseConfig from "@gabinete360/config/tailwind";

const config: Config = {
  presets: [baseConfig as any],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  plugins: [],
};

export default config;
