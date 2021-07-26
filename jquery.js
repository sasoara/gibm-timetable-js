/*
    jQuery stellt sicher, dass die function erst nach dem geladenen DOM ausgeführt wird.
*/
$(function () {

    handleElementDisplaying(false);
    htmlElements.JOB().on('change', handleSelectedJob);
    htmlElements.CLASS().on('change', handleSelectedClass);
    htmlElements.PREVIOUS().on('click', handlePreviousWeekButton);
    htmlElements.NEXT().on('click', handleNextWeekButton);
    htmlElements.CURRENT().on('click', handleCurrentWeekButton);

    getBerufe().then((jobs) => {
        const optionGroups = prepareOptionGroupsForBerufsgruppe(jobs);
        $('select.berufsgruppe').append(optionGroups);

        const options = prepareOptionsBerufe(jobs);
        options.forEach((option) => {
            const optionGroup = $(`optgroup[label = ${option.name[0]}]`);
            optionGroup.append(option.tag);
        });
        const jobId = localStorage.getItem(storageKeys.JOB_ID);
        if (jobId) {
            $(`#berufsgruppenAuswahl >> option[value=${jobId}]`).prop('selected', true);
            handleSelectedJob();
        }
    });

});
