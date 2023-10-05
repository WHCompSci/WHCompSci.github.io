// Weight classes for male and female wrestlers

const maleWeightClasses = [
    { weight: 106, label: "106 lbs" },
    { weight: 113, label: "113 lbs" },
    { weight: 120, label: "120 lbs" },
    { weight: 126, label: "126 lbs" },
    { weight: 132, label: "132 lbs" },
    { weight: 138, label: "138 lbs" },
    { weight: 144, label: "144 lbs" },
    { weight: 150, label: "150 lbs" },
    { weight: 157, label: "157 lbs" },
    { weight: 165, label: "165 lbs" },
    { weight: 175, label: "175 lbs" },
    { weight: 190, label: "190 lbs" },
    { weight: 215, label: "215 lbs" },
    { weight: 285, label: "285 lbs" },
];
//100, 107, 114, 120, 126, 132, 138, 145, 152, 165, 185, 235
//
const femaleWeightClasses = [
    { weight: 100, label: "100 lbs" },
    { weight: 107, label: "107 lbs" },
    { weight: 114, label: "114 lbs" },
    { weight: 120, label: "120 lbs" },
    { weight: 126, label: "126 lbs" },
    { weight: 132, label: "132 lbs" },
    { weight: 138, label: "138 lbs" },
    { weight: 145, label: "145 lbs" },
    { weight: 152, label: "152 lbs" },
    { weight: 165, label: "165 lbs" },
    { weight: 185, label: "185 lbs" },
    { weight: 235, label: "235 lbs" },
];

const table = document.getElementById("summary");
const summaryTitle = document.getElementById("summaryTitle");
const weightSelect = document.getElementById("weightClass");
const weight = () => parseFloat(document.getElementById("weight").value);
const sex = () => document.getElementById("sex").value;
const bodyFat = () => parseFloat(document.getElementById("bodyFat").value);
const weightClass = () => parseFloat(weightSelect.value);

function updateWeightClasses() {
    // Clear existing options
    weightSelect.innerHTML = "";

    // Select weight classes based on gender
    const weightClasses =
        sex() === "male" ? maleWeightClasses : femaleWeightClasses;

    // Add new options for weight classes
    weightClasses.forEach(function (weightClass) {
        const option = document.createElement("option");
        option.value = weightClass.weight;
        option.text = weightClass.label;
        weightSelect.appendChild(option);
    });
}

// Add event listener to gender dropdown
const sexSelect = document.getElementById("sex");
sexSelect.addEventListener("change", updateWeightClasses);

// Initial update of weight classes
updateWeightClasses();

document
    .getElementById("weightClassForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        // Calculate weight loss needed
        const weightDifference = weight() - weightClass();
        const bfMinimum = sex() === "male" ? 7 : 12;
        const bfPercentLossNeeded = (100 * weightDifference) / weight();
        const bfPercentAtGoalWeight = bodyFat() - bfPercentLossNeeded;
        const bodyFatDifference = bodyFat() - bfPercentAtGoalWeight;
        const LBSperWeek = 0.015 * weight();
        const daysUntilDesiredWeight = Math.ceil(
            7 * (weightDifference / LBSperWeek)
        );
        let resultText = "";

        if (weightDifference > 0) {
            if (bfPercentAtGoalWeight >= bfMinimum) {
                table.style.display = "flex";
                summaryTitle.style.display = "block";
                // Get today's date
                const today = new Date();
                const startDate = new Date(
                    document.getElementById("date").value
                );

                // Calculate the future date
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + daysUntilDesiredWeight);

                // Get the day and month of the future date
                const lastDay = endDate.getDate();
                const lastMonth = endDate.getMonth() + 1; // Months are zero-based, so we add 1

                const timeDiff = today.getTime() - startDate.getTime();

                // Convert milliseconds to days
                const daysSinceCertification = Math.ceil(
                    timeDiff / (1000 * 60 * 60 * 24)
                );
                const totalLBSlost = (daysSinceCertification / 7) * LBSperWeek;
                const todaysWeight = weight() - totalLBSlost;
                const are = today <= endDate ? "are" : "were";
                resultText += `You ${are} eligible to wrestle this weight class on ${lastMonth}/${lastDay}.`;
                if (today > startDate && today < endDate) {
                    resultText += `<br>Your weight today should be ${todaysWeight.toFixed(
                        1
                    )} lbs.`;
                }
                table.rows[0].cells[0].textContent = `Drop ${weightDifference.toFixed(
                    1
                )} lbs`;
                table.rows[0].cells[1].textContent = `${bfPercentLossNeeded.toFixed(
                    1
                )} % weight loss`;
                table.rows[1].cells[0].textContent = `${(
                    daysUntilDesiredWeight / 7
                ).toFixed(1)} week(s)`;
                table.rows[1].cells[1].textContent = `${daysUntilDesiredWeight} day(s)`;
            } else {
                table.style.display = "none";
                summaryTitle.style.display = "none";
                resultText = `You can't make ${weightClass()}. Your body fat would have to be ${bfPercentAtGoalWeight.toFixed(
                    1
                )}%, which is too low.`;
            }
        } else {
            table.style.display = "none";
            summaryTitle.style.display = "none";
            resultText = "You are already within the weight class.";
        }

        document.getElementById("result").innerHTML = resultText;
    });
