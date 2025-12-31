module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './src',
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@store': './src/store',
                        '@services': './src/services',
                        '@hooks': './src/hooks',
                        '@types': './src/types',
                        '@utils': './src/utils',
                        '@constants': './src/constants',
                        '@assets': './assets',
                    },
                },
            ],
        ],
    };
};
