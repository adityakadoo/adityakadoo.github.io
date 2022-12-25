window.onscroll = () => {
    var winScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.body.scrollHeight - window.innerHeight + 20;
    var scrolled = (winScrollTop / (height)) * 100;
    document.getElementById("myBar").style.width = scrolled + "%";
};

resizer = () => {
    const vw = Math.min(window.innerWidth,window.screen.width);
    var pages = document.getElementsByClassName("pages-item");
    var columns = document.getElementsByClassName("pages-column");
    var isSection = (columns.length !== 0);
    // console.log(vw, window.screen.width);
    if (isSection) {
        if (vw / 4 < 340) {
            document.getElementById("list-container").style.flexDirection = "column";
            document.getElementById("sections-container").style.width = "100%";
            document.getElementById("pages-container").style.width = "100%";
            var n_used_columns = Math.max(1, Math.floor(vw / 340));
        } else {
            document.getElementById("list-container").style.flexDirection = "row";
            document.getElementById("sections-container").style.width = "25%";
            document.getElementById("pages-container").style.width = "75%";
            var n_used_columns = Math.max(1, Math.floor((vw * 3 / 4) / 340));
        }
        // console.log(vw, n_used_columns);
        let n_pages = pages.length;
        let n_columns = columns.length;
        var sorted_pages = [];
        for (let i = 0; i < n_pages; i++) {
            let key = parseInt(pages[i].attributes.key.value);
            sorted_pages[key] = pages[i];
        }
        for (let i = 0; i < n_pages; i++) {
            columns[i % n_used_columns].appendChild(sorted_pages[i]);
        }
        for (let i = 0; i < n_columns; i++) {
            if (i < n_used_columns) {
                columns[i].style.flex = Math.floor(100 / n_used_columns) + "%";
            } else {
                columns[i].style.flex = "0%";
            }
        }
        if (window.screen.width < 680) {
            document.getElementById("pages-container").style.fontSize = "clamp(var(--font-size-lg), 5vw, var(--font-size-xl))";
        }
        else {
            document.getElementById("pages-container").style.fontSize = "inherit";
        }
    }

    if (document.getElementById("content") !== null) {
        if (vw * 3 / 10 < 350) {
            document.getElementById("content").style.flexDirection = "column-reverse";
            document.getElementById("content-markdown").style.width = "100%";
            document.getElementById("content-toc").style.width = "initial";
        } else {
            document.getElementById("content").style.flexDirection = "row";
            document.getElementById("content-markdown").style.width = "70%";
            document.getElementById("content-toc").style.width = "30%";
        }
    }

};

window.onresize = () => {
    resizer();
};

window.onload = () => {
    resizer();
};