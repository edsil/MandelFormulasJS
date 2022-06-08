"use strict";
var btnStart, btnSave, textoutput;
var z = 0;
var zVal = [];
var c = [];
window.onload = function () {
    btnStart = document.getElementById("btnStart");
    btnSave = document.getElementById("btnSave");
    textoutput = document.getElementById("textoutput");
    init();
    btnStart.onclick = function () {
        runNext(textoutput);
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
}

function square(arr, txtOut) {
    var resul = [];
    var ct = 0;
    var lng = arr.length;
    txtOut.innerHTML = "Starting....";
    for (var ctI1 = 0; ctI1 < lng; ctI1++) {
        textoutput.innerHTML += "\nPass " + String(ctI1) + " out " + String(lng);
        for (var ctI2 = 0; ctI2 < lng; ctI2++) {
            var m = arr[ctI1].mult(arr[ctI2]);
            var dupl = false;
            for (var idx = 0; idx < resul.length; idx++) {
                var r = resul[idx];
                if (r.aExp == m.aExp && r.bExp == m.bExp && r.imag == m.imag) {
                    r.coeff += m.coeff;
                    dupl = true;
                    break;
                }
            }
            if (!dupl) {
                resul.push(arr[ctI1].mult(arr[ctI2]));
                ct += 1;
            }
            if (ctI1 % Math.floor(lng / 1000) == 0) {
                txtOut.innerHTML =
                    String(ct) + " elements done.\n" + String(ctI1) + " out of" + String(lng) + " items procesed.";
            }
        }
    }
    return resul;
}

function add(arr, to_add) {
    for (var elem = 0; elem < to_add.length; elem++) {
        var dupl = false;
        for (var r = 0; r < arr.length; r++) {
            if (
                arr[r].aExp == to_add[elem].aExp &&
                arr[r].bExp == to_add[elem].bExp &&
                arr[r].imag == to_add[elem].imag
            ) {
                arr[r].coeff += to_add[elem].coeff;
                dupl = true;
                break;
            }
            if (!dupl) arr.push(to_add[elem]);
        }
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
    zVal.push(new G(0, 0, 0));
    c.push(new G(1, 1, 0));
    c.push(new G(1, 0, 1, true));
}

function runNext(txtOut) {
    zVal = square(zVal, txtOut);
    zVal = add(c, zVal);
    txtOut.innerHTML += "\n" + "z" + String(z) + " => Size: " + String(zVal.length);
    z += 1;
    return;
}

function genCSV() {
    var csvContent = saveResults(zVal);
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var name = "Z" + String(z) + ".csv";
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
}
