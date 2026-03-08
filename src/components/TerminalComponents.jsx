import React from 'react';

/**
 * Box component mimics Ink's Box.
 * It's a flexbox container with terminal-like spacing defaults.
 */
export const Box = ({
    children,
    flexDirection = 'row',
    paddingX = 0,
    paddingY = 0,
    padding = 0,
    marginX = 0,
    marginY = 0,
    margin = 0,
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    borderStyle,
    borderColor = 'rgba(255, 255, 255, 0.2)',
    width,
    height,
    className = '',
    style = {}
}) => {
    const boxStyle = {
        display: 'flex',
        flexDirection,
        padding: padding ? `${padding * 8}px` : undefined,
        paddingLeft: paddingX ? `${paddingX * 8}px` : undefined,
        paddingRight: paddingX ? `${paddingX * 8}px` : undefined,
        paddingTop: paddingY ? `${paddingY * 8}px` : undefined,
        paddingBottom: paddingY ? `${paddingY * 8}px` : undefined,
        margin: margin ? `${margin * 8}px` : undefined,
        marginLeft: marginX ? `${marginX * 8}px` : undefined,
        marginRight: marginX ? `${marginX * 8}px` : undefined,
        marginTop: marginY ? `${marginY * 8}px` : undefined,
        marginBottom: marginY ? `${marginBottom * 8}px` : undefined,
        justifyContent,
        alignItems,
        width,
        height,
        border: borderStyle === 'single' ? `1px solid ${borderColor}` : undefined,
        borderRadius: borderStyle === 'single' ? '4px' : undefined,
        ...style
    };

    return (
        <div className={`ink-box ${className}`} style={boxStyle}>
            {children}
        </div>
    );
};

/**
 * Text component mimics Ink's Text.
 */
export const Text = ({
    children,
    color = 'inherit',
    backgroundColor,
    bold = false,
    italic = false,
    dimColor = false,
    inverse = false,
    wrap = 'wrap',
    className = '',
    style = {}
}) => {
    const textStyle = {
        color: inverse ? 'black' : color,
        backgroundColor: inverse ? color : backgroundColor,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        opacity: dimColor ? 0.6 : 1,
        whiteSpace: wrap === 'wrap' ? 'normal' : 'pre',
        fontFamily: '"Menlo", "Monaco", "Consolas", "Courier New", monospace',
        ...style
    };

    return (
        <span className={`ink-text ${className}`} style={textStyle}>
            {children}
        </span>
    );
};

/**
 * Newline component for easy vertical spacing.
 */
export const Newline = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <br key={i} />
            ))}
        </>
    );
};
