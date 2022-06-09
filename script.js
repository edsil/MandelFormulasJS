"use strict";
var btnStart, btnSave, textoutput;
var z = 0;
var zVal = [];
var c = [];
// Used by the square function to process chuncks
var resul = [];
var cpZVal = [];
var ct = 0;
var lng = 0;
var ctI1 = 0;
var ctI2 = 0;
var isSquaring = false;
var locked = false;
var runs = 0;
var startProcessTime = 0;
window.onload = function () {
    btnStart = document.getElementById("btnStart");
    btnSave = document.getElementById("btnSave");
    textoutput = document.getElementById("textoutput");
    init();
    btnStart.onclick = function () {
        ProcessSquare(textoutput, updateZVal);
    };
    btnSave.onclick = function () {
        genCSV();
    };
};

class G {
    constructor(coeff, aExp = 0, bExp = 0, imag = false) {
        this.coeff = coeff;
        this.aExp = aExp;
        this.bExp = bExp;
        this.imag = imag;
    }

    mult(other) {
        var coeff = this.coeff * other.coeff;
        var aExp = this.aExp + other.aExp;
        var bExp = this.bExp + other.bExp;
        var imag = false;
        if (this.imag && other.imag) coeff *= -1;
        else if (this.imag != other.imag) imag = true;
        return new G(coeff, aExp, bExp, imag);
    }

    copy() {
        var coeff = this.coeff;
        var aExp = this.aExp;
        var bExp = this.bExp;
        var imag = this.imag;
        return new G(coeff, aExp, bExp, imag);
    }
}

function ProcessSquare(txtOut, callback) {
    if (isSquaring) {
        txtOut.innerHTML += "\nStill processing. Wait before running it again";
        return -1;
    }
    resul = [];
    cpZVal = [];
    cpZVal = Array.copy(zVal);
    ct = 0;
    lng = 0;
    ctI1 = 0;
    ctI2 = 0;
    isSquaring = true;
    runs = 0;
    startProcessTime = new Date();
    setTimeout(function () { processchunk(txtOut, callback) }, 10);
}

function processchunk(txtOut, callback) {
    var maxTime = 250;
    var delay = 50;
    var endtime = new Date() + maxTime;
    var finished = false;
    do {
        finished = square(txtOut);
    } while ((!finished) && (endtime > new Date()));
    if (!finished) {
        runs += 1;
        setTimeout(function () { processchunk(txtOut, callback) }, delay);
    } else {
        if (callback) callback();
    }
}

function square(txtOut) {
    if (lng == 0) {
        lng = cpZVal.length;
    }
    if (isSquaring) {
        var m = cpZVal[ctI1].mult(cpZVal[ctI2]);
        var dupl = false;
        for (var idx = 0; idx < resul.length; idx++) {
            var r = resul[idx];
            if (r.aExp == m.aExp && r.bExp == m.bExp && r.imag == m.imag) {
                resul[idx] = new G(r.coeff + m.coeff, m.aExp, m.bExp, m.imag);
                //r.coeff = r.coeff + m.coeff;
                dupl = true;
                break;
            }
        }
        if (!dupl) {
            resul.push(m);
            ct += 1;
        }
    }

    ctI2++;
    if (ctI2 == lng) {
        ctI2 = 0;
        ctI1++;
        if (ctI1 == lng) isSquaring = false;
        else {
            var timePassed = (new Date() - startProcessTime) / 1000;
            var updatetxt = "\nPass " + String(ctI1) + " out of " +
                String(lng) + ". " + String(runs) + " runs in " + String(timePassed) +
                " (" + String(runs / timePassed) + " runs/second)";
            textoutput.innerHTML += updatetxt;
        }
        return !isSquaring;
    }
}

function updateZVal() {
    z += 1;
    zVal = Array.copy(resul);
    zVal = add(c, zVal);
    zVal.sort(sortCoeff);
    cpZVal = [];
    resul = [];
    textoutput.innerHTML = "z" + String(z) + " => Size: " + String(zVal.length);
    return;
}

function sortCoeff(g, h) {
    if (!g.imag && h.imag) return -1;
    if (g.imag && !h.imag) return 1;
    if (g.aExp > h.aExp) return -1;
    if (g.aExp < h.aExp) return 1;
    if (g.bExp > h.bExp) return 1;
    if (g.bExp < h.bExp) return -1;
    return 0;
}

function add(arrOr, to_addOr) {
    var arr = Array.copy(arrOr);
    var to_add = Array.copy(to_addOr);
    var res = [];
    for (var elem = 0; elem < to_add.length; elem++) {
        var dupl = false;
        for (var r = 0; r < arr.length; r++) {
            if (
                arr[r].aExp == to_add[elem].aExp &&
                arr[r].bExp == to_add[elem].bExp &&
                arr[r].imag == to_add[elem].imag
            ) {
                arr[r] = new G(arr[r].coeff + to_add[elem].coeff, to_add[elem].aExp, to_add[elem].bExp, to_add[elem].imag);
                dupl = true;
                break;
            }
        }
        if (!dupl) arr.push(Array.copy(to_add[elem]));

    }
    return arr;
}

function saveResults(arr) {
    const rows = [["Coefficient", "Real/Imag", "aExp", "bExp"]];
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += rows.join(",") + "\r\n";
    arr.forEach(function (r) {
        let row = String(r.coeff) + "," + (r.imag ? "Imag" : "Real") + "," + String(r.aExp) + "," + String(r.bExp);
        csvContent += row + "\r\n";
    });
    return csvContent;
}

function init() {
    c.push(new G(1, 1, 0));
    c.push(new G(1, 0, 1, true));
    zVal = Array.copy(c);
    textoutput.innerHTML = "z" + String(z) + " => Size: " + String(zVal.length);
}

function genCSV() {
    if (isSquaring) {
        txtOut.innerHTML += "\nStill processing. Wait before saving.";
        return -1;
    }
    var csvContent = saveResults(zVal);
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var br1 = document.createElement("br");
    var br2 = document.createElement("br");
    var name = "Z" + String(z) + ".csv";
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    link.innerHTML = "Z" + String(z) + " download";
    document.body.appendChild(br1);
    document.body.appendChild(link);
    document.body.appendChild(br2);
}

Array.copy = function (arrFrom) {
    var arr = [];
    if (Array.isArray(arrFrom)) {
        arrFrom.forEach((element) => {
            var thisEl = element;
            if (Array.isArray(element)) {
                thisEl = Array.copy(element);
            }
            arr.push(thisEl.copy());
        });
    } else {
        arr = arrFrom.copy();
    }


    return arr;
};
