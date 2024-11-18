import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e0e7ff",
      100: "#c7d2fe",
      200: "#a5b4fc",
      300: "#818cf8",
      400: "#6366f1",
      500: "#4f46e5",
      600: "#4338ca",
      700: "#3730a3",
      800: "#312e81",
      900: "#1e1b4b",
    },
    blue: {
      50: "#ebf8ff",
      100: "#bee3f8",
      200: "#90cdf4",
      300: "#63b3ed",
      400: "#4299e1",
      500: "#3182ce",
      600: "#2b6cb0",
      700: "#2c5282",
      800: "#2a4365",
      900: "#1A365D",
    },
    gray: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "lg",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            borderRadius: "lg",
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: "gray.300",
            _hover: {
              borderColor: "gray.400",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px #4f46e5",
            },
          },
        },
      },
    },
  },
});

export default theme;
