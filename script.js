document.addEventListener("DOMContentLoaded", function() {
    const footer = document.getElementById("footer");
    const toggleButton = document.getElementById("toggle-footer");
    const nameSelect = document.getElementById("name-select");
    const clearListButton = document.getElementById("clear-list-button");
    let isExpanded = false;
    let linksData = {};

    // ��� ������ ����� ������� ������
    const storedLinksData = localStorage.getItem("linksData");
    if (storedLinksData) {
        linksData = JSON.parse(storedLinksData);
        Object.keys(linksData).forEach(name => {
            const newOption = document.createElement("option");
            newOption.value = name;
            newOption.textContent = name;
            nameSelect.appendChild(newOption);
        });
    }

    // ����� ������ ������
    toggleButton.addEventListener("click", function() {
        isExpanded = !isExpanded;
        footer.classList.toggle("expanded", isExpanded);
        footer.classList.toggle("compact", !isExpanded);
    });

    // ����� ��� ����� ��� �� �����
    document.getElementById("search-button").addEventListener("click", function() {
        const searchTerm = document.getElementById("search-term").value.trim();
        const errorMessage = document.getElementById("error-message");
        if (searchTerm) {
            let selectedEngine = nameSelect.value;
            if (!selectedEngine || selectedEngine === "Google") {
                const googleSearchLink = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
                window.open(googleSearchLink, '_blank');
            } else if (linksData[selectedEngine]) {
                const { link: firstLink, lastLink } = linksData[selectedEngine];
                const finalLink = `${firstLink}${encodeURIComponent(searchTerm)}${lastLink ? lastLink : ""}`;
                window.open(finalLink, '_blank');
            } else {
                errorMessage.textContent = "���� ������ ���� ��� ����.";
            }
        } else {
            errorMessage.textContent = "���� ����� ���� �����.";
        }
    });

    // ����� ��� ����� ��� ����� Enter
    document.getElementById("search-term").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            document.getElementById("search-button").click();
        }
    });

    // ����� ����� ������ �����
    window.filterFunction = function() {
        const input = document.getElementById("search-input");
        const filter = input.value.toLowerCase();
        const options = nameSelect.getElementsByTagName("option");

        for (let i = 1; i < options.length; i++) {
            const txtValue = options[i].textContent || options[i].innerText;
            options[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    };

    // ����� ������ ����� �� ��� Excel
    document.getElementById("add-search-button").addEventListener("click", function() {
        const fileInput = document.getElementById("excel-file");
        const excelError = document.getElementById("excel-error");
        const file = fileInput.files[0];
        if (!file) {
            excelError.textContent = "���� ������ ��� Excel.";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 1) {
                linksData = {};
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const name = row[0];
                    const link = row[1];
                    const lastLink = row[2] || "";
                    linksData[name] = { link, lastLink };

                    const newOption = document.createElement("option");
                    newOption.value = name;
                    newOption.textContent = name;
                    nameSelect.appendChild(newOption);
                }
                localStorage.setItem("linksData", JSON.stringify(linksData));
                excelError.textContent = "�� ����� ������ ����� �����.";
            } else {
                excelError.textContent = "����� ���� �� ������ ��� ����.";
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // ����� ����� ������ �����
    clearListButton.addEventListener("click", function() {
        nameSelect.innerHTML = '<option value="">���� ������</option>';
        localStorage.removeItem("linksData");
        linksData = {};
    });

    // ����� ��� ������ ���� �����
    nameSelect.addEventListener("change", function() {
        footer.classList.remove("compact");
        footer.classList.add("expanded");
        document.getElementById("search-section").style.display = "none";
        document.getElementById("error-message").textContent = "";

        // ����� ������ ������ ������
        footer.classList.remove("expanded");
        footer.classList.add("compact");
    });
});

function toggleSearchOptions() {
    const searchSection = document.getElementById("search-section");
    searchSection.style.display = searchSection.style.display === "none" ? "block" : "none";
}
