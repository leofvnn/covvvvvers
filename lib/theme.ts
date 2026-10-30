/** Runs before the page paints, so a dark-mode visitor never sees a white flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;
