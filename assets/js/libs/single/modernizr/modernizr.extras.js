/* != Extra test for Modernizr */

/**
 * Modernizr test for retina / high resolution / high pixel density
 *
 * @author Joao Cunha
 * @license MIT
 */

Modernizr.addTest('retina', function() {
    // starts with default value for modern browsers
    var dpr = window.devicePixelRatio ||

    // fallback for IE
        (window.screen.deviceXDPI / window.screen.logicalXDPI) ||

    // default value
        1;

    return !!(dpr > 1);
});