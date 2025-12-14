import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const colors = {
    // Bitcoin Gold / Brand
    brand: {
        50: '#fff9e6',
        100: '#ffebb3',
        200: '#ffdd80',
        300: '#ffce4d',
        400: '#ffbf1a',
        500: '#f7931a', // Bitcoin Orange/Gold
        600: '#c27214',
        700: '#8f520e',
        800: '#5c3308',
        900: '#291402',
    },
    // Green for Money/Success
    secondary: {
        50: '#e6fffa',
        100: '#b2f5ea',
        200: '#81e6d9',
        300: '#4fd1c5',
        400: '#38b2ac',
        500: '#319795',
        600: '#2c7a7b',
        700: '#285e61',
        800: '#234e52',
        900: '#1d4044',
    },
    // Dark Backgrounds
    dark: {
        bg: '#0a0a0a',
        card: '#1a1a1a',
        border: '#333333',
    },
    primary: {
        main: '#f7931a', // Alias for brand.500
        light: '#ffbf1a',
        dark: '#c27214',
    }
}

const styles = {
    global: (props: any) => ({
        body: {
            bg: props.colorMode === 'dark' ? 'dark.bg' : 'gray.50',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        },
    }),
}

const components = {
    Card: {
        baseStyle: (props: any) => ({
            container: {
                bg: props.colorMode === 'dark' ? 'dark.card' : 'white',
                borderColor: props.colorMode === 'dark' ? 'dark.border' : 'gray.200',
                borderWidth: '1px',
            },
        }),
    },
    Button: {
        variants: {
            brand: {
                bg: 'brand.500',
                color: 'white',
                _hover: {
                    bg: 'brand.400',
                },
            },
            outline: (props: any) => ({
                borderColor: 'brand.500',
                color: 'brand.500',
                _hover: {
                    bg: 'whiteAlpha.100',
                },
            }),
        },
        defaultProps: {
            colorScheme: 'brand',
        },
    },
}

const theme = extendTheme({ config, colors, styles, components })

export default theme
