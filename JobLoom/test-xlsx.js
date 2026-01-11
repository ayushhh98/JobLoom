import * as XLSX from 'xlsx';

try {
    const ws = XLSX.utils.json_to_sheet([{ name: "Test" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    // Just verify it doesn't crash
    console.log("XLSX import and basic functions working.");
} catch (error) {
    console.error("XLSX test failed:", error);
}
