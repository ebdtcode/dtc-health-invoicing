const ExcelJS = require('exceljs');
const Mailjet = require('node-mailjet');

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);

module.exports = async function (context, req) {
    context.log('Timesheet generation request received');

    try {
        // Validate request
        if (!req.body) {
            context.res = {
                status: 400,
                body: { error: 'Request body is required' }
            };
            return;
        }

        const {
            clientId,
            clientName,
            clientEmail,
            cycleEndDate,
            providerName,
            targetHours,
            notes,
            entries
        } = req.body;

        // Validation
        if (!clientId || !clientName || !clientEmail || !cycleEndDate || !providerName || !entries) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        if (!Array.isArray(entries) || entries.length === 0) {
            context.res = {
                status: 400,
                body: { error: 'At least one time entry is required' }
            };
            return;
        }

        context.log(`Generating timesheet for ${clientName}`);

        // Generate Excel workbook
        const excelBuffer = await generateTimesheetExcel({
            clientName,
            cycleEndDate,
            providerName,
            targetHours,
            notes,
            entries
        });

        // Send email with attachment
        const emailResult = await sendTimesheetEmail({
            clientEmail,
            clientName,
            providerName,
            cycleEndDate,
            excelBuffer
        });

        context.log('Timesheet sent successfully');

        context.res = {
            status: 200,
            body: {
                success: true,
                message: 'Timesheet generated and sent successfully',
                messageId: emailResult.Messages[0].To[0].MessageID
            }
        };

    } catch (error) {
        context.log.error('Error generating timesheet:', error);
        context.res = {
            status: 500,
            body: {
                error: 'Failed to generate timesheet',
                details: error.message
            }
        };
    }
};

async function generateTimesheetExcel({ clientName, cycleEndDate, providerName, targetHours, notes, entries }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timesheet');

    // Daytocare Health Services brand colors
    const brandColor = 'C9354D'; // Red/pink brand color
    const lightBrandColor = 'FFF5F7'; // Light pink background
    const headerTextColor = 'FFFFFF'; // White text
    const darkGray = '333333';
    const mediumGray = '666666';
    const lightGray = 'F8F9FA';

    // Set column widths
    worksheet.columns = [
        { width: 30 }, // Column A - Date/Labels
        { width: 15 }  // Column B - Hours/Values
    ];

    // Add company header with styling
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'Daytocare Health Services';
    titleRow.getCell(1).font = {
        size: 18,
        bold: true,
        color: { argb: brandColor }
    };
    titleRow.height = 30;
    titleRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Subtitle
    const subtitleRow = worksheet.getRow(2);
    subtitleRow.getCell(1).value = 'Bi-Weekly Time Sheet';
    subtitleRow.getCell(1).font = {
        size: 14,
        color: { argb: mediumGray }
    };
    subtitleRow.height = 25;

    // Add spacing
    worksheet.getRow(3).height = 15;

    // Community/Client information header
    const communityRow = worksheet.getRow(4);
    communityRow.getCell(1).value = `Community: ${clientName}`;
    communityRow.getCell(1).font = {
        size: 12,
        bold: true,
        color: { argb: darkGray }
    };
    communityRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: lightBrandColor }
    };
    communityRow.getCell(1).border = {
        top: { style: 'thin', color: { argb: brandColor } },
        left: { style: 'thin', color: { argb: brandColor } },
        bottom: { style: 'thin', color: { argb: brandColor } },
        right: { style: 'thin', color: { argb: brandColor } }
    };
    communityRow.height = 25;
    communityRow.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // Cycle ending date
    const cycleRow = worksheet.getRow(5);
    cycleRow.getCell(1).value = `Cycle Ending Date: ${formatDate(cycleEndDate)}`;
    cycleRow.getCell(1).font = {
        size: 11,
        color: { argb: mediumGray }
    };
    cycleRow.height = 20;

    // Provider name
    const providerRow = worksheet.getRow(6);
    providerRow.getCell(1).value = `Service Provider: ${providerName}`;
    providerRow.getCell(1).font = {
        size: 11,
        bold: true,
        color: { argb: darkGray }
    };
    providerRow.height = 20;

    // Add spacing before table
    worksheet.getRow(7).height = 10;

    // Table header row
    const headerRow = worksheet.getRow(8);
    headerRow.getCell(1).value = 'Date';
    headerRow.getCell(2).value = 'Hours Worked';
    
    // Style header row
    [1, 2].forEach(col => {
        const cell = headerRow.getCell(col);
        cell.font = {
            size: 11,
            bold: true,
            color: { argb: headerTextColor }
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: brandColor }
        };
        cell.border = {
            top: { style: 'thin', color: { argb: brandColor } },
            left: { style: 'thin', color: { argb: brandColor } },
            bottom: { style: 'thin', color: { argb: brandColor } },
            right: { style: 'thin', color: { argb: brandColor } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 25;

    // Add data rows
    let currentRow = 9;
    let totalHours = 0;

    entries.forEach((entry, index) => {
        const row = worksheet.getRow(currentRow);
        
        // Format date nicely
        const dateObj = new Date(entry.date + 'T00:00:00');
        const formattedDate = `${entry.dayName}, ${dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        })}`;
        
        row.getCell(1).value = formattedDate;
        row.getCell(2).value = entry.hours;
        
        // Alternate row colors for better readability
        const bgColor = index % 2 === 0 ? 'FFFFFF' : lightGray;
        
        [1, 2].forEach(col => {
            const cell = row.getCell(col);
            cell.font = {
                size: 10,
                color: { argb: darkGray }
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: bgColor }
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'E0E0E0' } },
                left: { style: 'thin', color: { argb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
                right: { style: 'thin', color: { argb: 'E0E0E0' } }
            };
            cell.alignment = { 
                vertical: 'middle', 
                horizontal: col === 1 ? 'left' : 'center',
                indent: col === 1 ? 1 : 0
            };
        });
        
        row.height = 22;
        totalHours += entry.hours;
        currentRow++;
    });

    // Total row
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'Total Hours';
    totalRow.getCell(2).value = totalHours;
    
    [1, 2].forEach(col => {
        const cell = totalRow.getCell(col);
        cell.font = {
            size: 12,
            bold: true,
            color: { argb: headerTextColor }
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: brandColor }
        };
        cell.border = {
            top: { style: 'medium', color: { argb: brandColor } },
            left: { style: 'medium', color: { argb: brandColor } },
            bottom: { style: 'medium', color: { argb: brandColor } },
            right: { style: 'medium', color: { argb: brandColor } }
        };
        cell.alignment = { 
            vertical: 'middle', 
            horizontal: col === 1 ? 'left' : 'center',
            indent: col === 1 ? 1 : 0
        };
    });
    totalRow.height = 28;

    // Add notes if provided
    if (notes) {
        currentRow += 2;
        const notesLabelRow = worksheet.getRow(currentRow);
        notesLabelRow.getCell(1).value = 'Notes:';
        notesLabelRow.getCell(1).font = {
            size: 10,
            bold: true,
            color: { argb: darkGray }
        };
        
        currentRow++;
        const notesRow = worksheet.getRow(currentRow);
        notesRow.getCell(1).value = notes;
        notesRow.getCell(1).font = {
            size: 10,
            color: { argb: mediumGray },
            italic: true
        };
        notesRow.alignment = { wrapText: true };
    }

    // Add summary box
    currentRow += 2;
    const summaryRow = worksheet.getRow(currentRow);
    summaryRow.getCell(1).value = `Target Hours: ${targetHours || 60}`;
    summaryRow.getCell(2).value = `Days Worked: ${entries.length}`;
    
    [1, 2].forEach(col => {
        const cell = summaryRow.getCell(col);
        cell.font = {
            size: 10,
            color: { argb: mediumGray }
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: lightGray }
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'CCCCCC' } },
            left: { style: 'thin', color: { argb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
            right: { style: 'thin', color: { argb: 'CCCCCC' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Footer with generation date
    currentRow += 2;
    const footerRow = worksheet.getRow(currentRow);
    footerRow.getCell(1).value = `Generated on ${new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
    footerRow.getCell(1).font = {
        size: 9,
        color: { argb: mediumGray },
        italic: true
    };
    footerRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

async function sendTimesheetEmail({ clientEmail, clientName, providerName, cycleEndDate, excelBuffer }) {
    const formattedDate = formatDate(cycleEndDate);
    const filename = `Timesheet_${providerName.replace(/\s+/g, '_')}_${cycleEndDate}.xlsx`;

    const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: process.env.SENDER_EMAIL || 'billing@daytocarehealthservices.com',
                        Name: 'Daytocare Health Services'
                    },
                    To: [
                        {
                            Email: clientEmail,
                            Name: clientName
                        }
                    ],
                    Subject: `Timesheet - ${providerName} - Cycle Ending ${formattedDate}`,
                    TextPart: `Dear ${clientName},\n\nPlease find attached the timesheet for ${providerName} for the bi-weekly cycle ending ${formattedDate}.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nDaytocare Health Services`,
                    HTMLPart: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #C9354D 0%, #D84A5F 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Daytocare Health Services</h1>
                                <p style="margin: 10px 0 0 0; opacity: 0.9;">Bi-Weekly Timesheet</p>
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                                    Dear <strong>${clientName}</strong>,
                                </p>
                                
                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    Please find attached the timesheet for <strong>${providerName}</strong> 
                                    for the bi-weekly cycle ending <strong>${formattedDate}</strong>.
                                </p>
                                
                                <div style="background: white; border-left: 4px solid #C9354D; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; color: #666; font-size: 14px;">
                                        📎 <strong>Attachment:</strong> ${filename}
                                    </p>
                                </div>
                                
                                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                                    If you have any questions or need clarification, please don't hesitate to contact us.
                                </p>
                                
                                <p style="color: #555; font-size: 15px; line-height: 1.6; margin-top: 30px;">
                                    Best regards,<br>
                                    <strong style="color: #C9354D;">Daytocare Health Services</strong>
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 15px; color: #999; font-size: 12px;">
                                <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
                            </div>
                        </div>
                    `,
                    Attachments: [
                        {
                            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            Filename: filename,
                            Base64Content: excelBuffer.toString('base64')
                        }
                    ]
                }
            ]
        });

    return request;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
}
