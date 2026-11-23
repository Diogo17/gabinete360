export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#172b27",
          light: "#26423c",
        },
        muted: {
          DEFAULT: "#77847f",
          light: "#a4ada8",
          dark: "#54605b",
        },
        line: {
          DEFAULT: "#e8eeea",
          dark: "#d5dfd8",
        },
        paper: {
          DEFAULT: "#f6f8f5",
          pure: "#ffffff",
        },
        green: {
          DEFAULT: "#176b52",
          hover: "#125440",
          dark: "#0d3a2c",
          light: "#218a6a",
        },
        mint: {
          DEFAULT: "#e8f3ed",
          dark: "#d6e5dd",
          light: "#f2f8f5",
        },
        gold: {
          DEFAULT: "#c78c38",
          hover: "#a8742b",
          light: "#fff4df",
        },
        red: {
          DEFAULT: "#bb5d51",
          hover: "#9f4a3f",
          light: "#faecea",
        },
        blue: {
          DEFAULT: "#557a98",
          hover: "#45647d",
          light: "#eaf1f6",
        },
        tag: {
          amberBg: "#fff4df",
          amberText: "#9e702b",
          blueBg: "#eaf1f6",
          blueText: "#4c718e",
          greenBg: "#e8f3ed",
          greenText: "#327255",
          redBg: "#faecea",
          redText: "#aa5147",
        },
        toast: {
          bg: "#193d31",
          text: "#ffffff",
        },
        notice: {
          bg: "#fbfcf5",
          border: "#e7ebdc",
          text: "#64724f",
        },
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "Manrope", "sans-serif"],
        body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "9px",
        lg: "10px",
        xl: "12px",
        squircle: "11px",
        pill: "20px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(23, 43, 39, 0.04), 0 1px 2px -1px rgba(23, 43, 39, 0.03)",
        floating: "0 10px 25px -5px rgba(23, 43, 39, 0.1), 0 8px 10px -6px rgba(23, 43, 39, 0.08)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default tailwindPreset;
