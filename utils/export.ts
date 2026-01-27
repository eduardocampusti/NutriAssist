export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Get headers from first object keys
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(';'), // CSV Header
        ...data.map(row => headers.map(fieldName => {
            const value = row[fieldName];
            // Handle null/undefined
            if (value === null || value === undefined) return '';
            // Handle strings with separators
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`; // Escape quotes
            }
            // Handle arrays/objects
            if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return value;
        }).join(';'))
    ].join('\r\n');

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
