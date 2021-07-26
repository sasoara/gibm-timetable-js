const serverUrl = 'http://sandbox.gibm.ch';

const storageKeys = {
    JOB_ID: 'job_id',
    CLASS_ID: 'class_id'
};

Object.freeze(storageKeys);

const htmlElements = {
    MESSAGE: () => $('#message'),
    JOB: () => $('#berufsgruppenAuswahl'),
    CLASS: () => $('#klassenAuswahl'),
    WEEKDISPLAY: () => $('#wochenanzeige'),
    PREVIOUS: () => $('#previous'),
    CURRENT: () => $('#current'),
    WEEK: () => $('#week'),
    NEXT: () => $('#next'),
    PROGRESSBAR: () => $('#progressbar'),
    TABLE: () => $('#table')
};

Object.freeze(htmlElements);

const tableHeadContent =
    `<tr>
        <th>Datum</th>
        <th>Wochentag</th>
        <th>Von</th>
        <th>Bis</th>
        <th>Lehrer</th>
        <th>Fach</th>
        <th>Raum</th>
    </tr>`;

/*
     @ms_Day : ist ein Tag gegeben in Millisekunden.
     @ms_Week : ist eine Woche, gegeben in Millisekunden.
*/
const ms_Day = 86400000;
const ms_Week = 604800000;

let closestThursday = calcClosestThursday(new Date());

/*
    Nimmt als Parameter eine Fehlermeldung und
    gibt diese aus.
*/
function showError(message) {
    htmlElements.MESSAGE().show().text(message);
}

/*
    Bekommt als Parameter die Berufe und konstruiert aus
    den Anfangsbuchstaben alphabetisch sortierte Gruppen.
*/
function prepareOptionGroupsForBerufsgruppe(jobs) {
    const firstLetters = $.unique(jobs.map((job) => job.beruf_name[0]));
    return firstLetters.map((letter) => `<optgroup label=${letter}></optgroup>`);
}

/*
    Bekommt als Parameter die Berufe und gibt die
    Berufsbezeichnung und den HTML-Tag dazu aus.
*/
function prepareOptionsBerufe(jobs) {
    return jobs.map((job) => {
        return {
            name: job.beruf_name,
            tag: `<option value=${job.beruf_id}>${job.beruf_name}</option>`
        }
    });
}

/*
    Bekommt als Parameter die Klassen und konstruiert mit
    diesen Daten die HTML-Option-Tags.
*/
function prepareOptionsKlassen(klassen) {
    return klassen.map((klasse) => `<option value=${klasse.klasse_id}>${klasse.klasse_name}</option>`);
}

/*
    Bekommt als Parameter ein Datum Objekt und setzt es
    auf den naheliegendsten Donnerstag.
*/
function calcClosestThursday(date) {
    const thursday = new Date(date);
    thursday.setHours(0, 0, 0, 0);
    thursday.setDate(thursday.getDate() + 4 - (thursday.getDay() || 7));
    return thursday;
}

/*
    Bekommt als Parameter ein Datum Objekt und gibt davon
    die Wochennummer und das Jahr ('WW-YYYY') zurück.
*/
function dateToWeekYearString(date) {
    const thursday = calcClosestThursday(date);
    const year = new Date(thursday.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((thursday - year) / ms_Day) + 1) / 7);
    return `${weekNumber}-${year.getFullYear()}`;
}

/*
    Bekommt als Parameter ein Datum Objekt und zieht
    davon exakt eine Woche ab.
*/
function subtractWeek(date) {
    return new Date(date.getTime() - ms_Week);
}

/*
    Bekommt als Parameter ein Datum Objekt und addiert
    davon exakt eine Woche dazu.
*/
function addWeek(date) {
    return new Date(date.getTime() + ms_Week);
}

/*
    Bekommt als Parameter das aktuelle Datum im Format 'yyyy-mm-dd'
    und gibt das Datum im Fromat 'dd.mm.yyy' zurück.
*/
function formatDate(dateString) {
    const splitDate = dateString.split('-');
    return `${splitDate[2]}.${splitDate[1]}.${splitDate[0]}`;
}

/*
    Bekommt als Parameter den Tag als Nummer (0-6)->(So-Sa)
    welche ihn als Wort zurück gibt.
*/
function formatWeekday(dayAsNumber) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayAsNumber];
}

/*
    Schneidet die Sekunden weg.
*/
function formatTime(time) {
    return time.substring(0, 5);
}

/*
    Bekommt als Parameter die Stundenplandaten, welche diese
    zu HTML-Table-Tags formt und ausgibt.
*/
function getTableContent(tafeln) {
    return tafeln.map((tafel) =>
        `<tr>
            <td>${formatDate(tafel.tafel_datum)}</td>
            <td>${formatWeekday(tafel.tafel_wochentag)}</td>
            <td>${formatTime(tafel.tafel_von)}</td>
            <td>${formatTime(tafel.tafel_bis)}</td>
            <td>${tafel.tafel_lehrer}</td>
            <td>${tafel.tafel_fach}</td>
            <td>${tafel.tafel_raum}</td>
        </tr>`
    );
}

/*
    Gibt in der Tabelle die Ferienmitteilung aus.
*/
function getHolidayContent() {
    return `<tbody><tr><td class="text-center">FERIEN</td></tr></tbody>`;
}

/*
    Bekommt als Parameter einen Bool'schen Wert übergeben
    welcher dann entweder die Wochenanzeige & die Tabelle verschwinden
    oder anzeigen lässt.
*/
function handleElementDisplaying(visible) {
    if (visible) {
        htmlElements.TABLE().addClass('d-table').show();
        htmlElements.WEEKDISPLAY().addClass('d-table').show();
    } else {
        htmlElements.TABLE().removeClass('d-table').hide();
        htmlElements.WEEKDISPLAY().removeClass('d-table').hide();
    }
}

/*
    Gibt die Daten(Berufe) der Schulwebseite zurück wenn das Laden erfolgreich war,
    ansonsten wird eine Fehlermeldung ausgegeben.
*/
function getBerufe() {
    return $.getJSON(`${serverUrl}/berufe.php`)

        .done((jobs) => jobs)

        .fail(() => showError("Berufe können nicht geladen werden. Überprüfe den Link."));
}

/*
    Bekommt als Parameter die Berufid (default 0) und
    gibt die Daten(Klassen) der Schulwebseite zurück wenn das Laden erfolgreich war,
    ansonsten wird eine Fehlermeldung ausgegeben.
*/
function getKlassen(beruf_id = 0) {
    return $.getJSON(`${serverUrl}/klassen.php?beruf_id=${beruf_id}`)

        .done((schoolClasses) => schoolClasses)

        .fail(() => showError("Klassen können nicht geladen werden. Überprüfe den Link."));
}

/*
    Bekommt als Parameter die Klassenid (default 0) und die Woche im Format 'ww-yyyy'
    und gibt die Daten(Stundenplan) der Schulwebseite zurück wenn das Laden erfolgreich war,
    ansonsten wird eine Fehlermeldung ausgegeben.
*/
function getTafel(klasse_id = 0, woche) {
    const url = woche ? `${serverUrl}/tafel.php?klasse_id=${klasse_id}&woche=${woche}` :
        `${serverUrl}/tafel.php?klasse_id=${klasse_id}`;
    return $.getJSON(url)

        .done((timeTable) => timeTable)

        .fail(() => showError("Stundenplandaten können nicht geladen werden. Überprüfe den Link."));
}

/*
    Wird aufgerufen, sobald ein Beruf ausgewählt worden ist.
*/
function handleSelectedJob() {
    htmlElements.CLASS().html('');
    window.setTimeout(() => {
        const classesEmpty = htmlElements.CLASS().children().length;
        if (!classesEmpty) {
            htmlElements.PROGRESSBAR().fadeIn(300);
        }
    }, 300);
    handleElementDisplaying(false);
    const selectedJob = $('#berufsgruppenAuswahl >> option:selected');
    localStorage.setItem(storageKeys.JOB_ID, selectedJob.val());
    const storageJobId = localStorage.getItem(storageKeys.JOB_ID);
    getKlassen(selectedJob ? selectedJob.val() : storageJobId)
        .then(fillKlassenAuswahl);
}

/*
    Befüllt die Klassenauswahl mit HTML <option>.
*/
function fillKlassenAuswahl(klassen) {
    const options = prepareOptionsKlassen(klassen);
    htmlElements.CLASS().html('<option selected>Bitte Klasse wählen</option>');
    options.forEach((option) => {
        htmlElements.CLASS().append(option);
    });
    const storageClassId = localStorage.getItem(storageKeys.CLASS_ID);
    const optionToSelect = $(`#klassenAuswahl > option[value=${storageClassId}]`);
    if (optionToSelect) {
        optionToSelect.prop('selected', true);
        handleSelectedClass();
    }
    htmlElements.PROGRESSBAR().hide();
}

/*
    Entfernt das erste <option> Element "Bitte Klasse wählen" und führt
    die befüllende Tabellen-Funktion aus, wenn eine Klasse ausgewählt worden ist.
*/
function handleSelectedClass() {
    $('#klassenAuswahl option').first().hide();
    const selectedClass = $('#klassenAuswahl > option:selected');
    if (selectedClass.val() != "Bitte Klasse wählen") {
        localStorage.setItem(storageKeys.CLASS_ID, selectedClass.val());
        fillTimeTable(closestThursday);
    } else {
        localStorage.setItem(storageKeys.CLASS_ID, null);
    }

}

/*
    Führt den Tabellen- Kopf und Körper zusammen.
*/
function composeTable(tafeln) {
    return `<thead class="thead-light">${tableHeadContent}</thead><tbody>${getTableContent(tafeln)}</tbody>`;
}

/*
    Übergibt der befüllenden Tabellen-Funktion die Funktion mit, die
    die vorherige Woche ausgibt.
*/
function handlePreviousWeekButton() {
    closestThursday = subtractWeek(closestThursday);
    fillTimeTable(closestThursday);
}

/*
    Übergibt der befüllenden Tabellen-Funktion die Funktion mit, die
    die nächste Woche ausgibt.
*/
function handleNextWeekButton() {
    closestThursday = addWeek(closestThursday);
    fillTimeTable(closestThursday);
}

/*
    Übergibt der befüllenden Tabellen-Funktion die Funktion mit, die
    die aktuelle Woche ausgibt.
*/
function handleCurrentWeekButton() {
    closestThursday = calcClosestThursday(new Date());
    fillTimeTable(closestThursday);
}

/*
    Befüllt die Tabelle anhand des mitgegebenen Datum Objekt.
*/
function fillTimeTable(date) {
    const selectedClass = $('#klassenAuswahl > option:selected');
    const anotherWeek = dateToWeekYearString(date);
    htmlElements.TABLE().removeClass('d-table').hide();
    htmlElements.WEEK().text(anotherWeek);
    window.setTimeout(() => {
        const timeTableVisible = htmlElements.TABLE().filter(':visible').length;
        if (!timeTableVisible) {
            htmlElements.PROGRESSBAR().fadeIn(300);
        }
    }, 300);
    getTafel(selectedClass.val(), anotherWeek).then((tafeln) => {
        const tafelEmpty = tafeln.length;
        const tableContent = !tafelEmpty ? getHolidayContent() : composeTable(tafeln);
        htmlElements.TABLE().html(tableContent);
        htmlElements.PROGRESSBAR().hide();
        handleElementDisplaying(true);
    });
}

module.exports = { addWeek, showError, formatDate, formatWeekday };
