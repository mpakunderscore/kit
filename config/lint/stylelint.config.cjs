module.exports = {
    extends: ['stylelint-config-standard'],
    ignoreFiles: ['dist/**/*', 'node_modules/**/*'],
    rules: {
        // Align with AGENTS.md: snake_case only; no BEM-style `__` or `--` in class names.
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(_[a-z0-9]+)*$',
            { message: 'Use snake_case for class names (e.g. game_shell, red_stroke).' },
        ],
        'no-descending-specificity': null,
        'no-duplicate-selectors': null,
        'color-hex-length': null,
        // Allow modern/experimental properties used by Safari/Chromium (we validate via runtime, not lint).
        'property-no-unknown': [true, { ignoreProperties: ['text-wrap'] }],
    },
}
