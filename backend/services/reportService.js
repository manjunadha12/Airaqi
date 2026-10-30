const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

const generatePDFReport = async (reportData, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, '../reports', fileName);

      // Create reports directory if it doesn't exist
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Title
      doc.fontSize(20).text('AirSense Cloud - AQI Report', 100, 100);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 100, 130);

      // Report Details
      doc.fontSize(14).text('Report Summary', 100, 170);
      doc.fontSize(11).text(`Average AQI: ${reportData.averageAQI}`, 100, 200);
      doc.fontSize(11).text(`Highest AQI: ${reportData.highestAQI}`, 100, 220);
      doc.fontSize(11).text(`Lowest AQI: ${reportData.lowestAQI}`, 100, 240);
      doc.fontSize(11).text(`Report Period: ${reportData.period}`, 100, 260);

      // Pollutants Table
      doc.fontSize(14).text('Pollutants Analysis', 100, 310);
      let yPosition = 340;
      doc
        .fontSize(10)
        .text(`PM2.5: ${reportData.pollutants.pm2_5} µg/m³`, 100, yPosition);
      doc
        .fontSize(10)
        .text(`PM10: ${reportData.pollutants.pm10} µg/m³`, 100, (yPosition += 20));
      doc
        .fontSize(10)
        .text(`NO2: ${reportData.pollutants.no2} ppb`, 100, (yPosition += 20));
      doc
        .fontSize(10)
        .text(`SO2: ${reportData.pollutants.so2} ppb`, 100, (yPosition += 20));
      doc
        .fontSize(10)
        .text(`CO: ${reportData.pollutants.co} ppm`, 100, (yPosition += 20));

      // Recommendations
      doc.fontSize(14).text('Recommendations', 100, (yPosition += 40));
      doc
        .fontSize(11)
        .text(reportData.recommendations || 'No specific recommendations at this time.', 100, (yPosition += 30));

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const generateExcelReport = async (reportData, fileName) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AQI Report');

    // Headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'AQI', key: 'aqi', width: 10 },
      { header: 'PM2.5', key: 'pm2_5', width: 10 },
      { header: 'PM10', key: 'pm10', width: 10 },
      { header: 'Temperature', key: 'temperature', width: 12 },
      { header: 'Humidity', key: 'humidity', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Add data
    if (reportData.records && Array.isArray(reportData.records)) {
      reportData.records.forEach((record) => {
        worksheet.addRow({
          date: new Date(record.timestamp).toLocaleDateString(),
          aqi: record.aqi.value,
          pm2_5: record.pollutants.pm2_5,
          pm10: record.pollutants.pm10,
          temperature: record.environmental.temperature,
          humidity: record.environmental.humidity,
          status: record.aqi.category,
        });
      });
    }

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };

    const filePath = path.join(__dirname, '../reports', fileName);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    throw error;
  }
};

const generateCSVReport = async (reportData, fileName) => {
  try {
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../reports', fileName),
      header: [
        { id: 'date', title: 'Date' },
        { id: 'aqi', title: 'AQI' },
        { id: 'pm2_5', title: 'PM2.5' },
        { id: 'pm10', title: 'PM10' },
        { id: 'temperature', title: 'Temperature' },
        { id: 'humidity', title: 'Humidity' },
        { id: 'status', title: 'Status' },
      ],
    });

    const records = (reportData.records || []).map((record) => ({
      date: new Date(record.timestamp).toLocaleDateString(),
      aqi: record.aqi.value,
      pm2_5: record.pollutants.pm2_5,
      pm10: record.pollutants.pm10,
      temperature: record.environmental.temperature,
      humidity: record.environmental.humidity,
      status: record.aqi.category,
    }));

    await csvWriter.writeRecords(records);
    return path.join(__dirname, '../reports', fileName);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generatePDFReport,
  generateExcelReport,
  generateCSVReport,
};
