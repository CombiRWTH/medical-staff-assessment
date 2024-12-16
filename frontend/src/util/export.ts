import ExcelJS from 'exceljs'

export type StationDaily = {
  id: number,
  name: string,
  minutes: number
}

export type StationMonthly = {
  id: number,
  name: string,
  data: { day: number, minutes: number }[],
  sum: number
}

const getFormattedDate = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${day}-${month}-${year}-${hours}:${minutes}`
}

export const saveAsExcelFile = (buffer: ArrayBuffer, fileName: string): void => {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportDailyAnalysis = async (stations: StationDaily[]): Promise<void> => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Analyse')

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Minuten', key: 'minutes', width: 15 }
  ]

  const totalSum = stations.reduce((total, station) => total + station.minutes, 0)

  stations.forEach((station) => {
    worksheet.addRow({ id: station.id, name: station.name, minutes: station.minutes })
  })

  const totalRow = worksheet.addRow({
    id: -1,
    name: 'Gesamt',
    minutes: totalSum
  })

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' }
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAsExcelFile(buffer, `${getFormattedDate()}_Tägliche_Analyse.xlsx`)
}

export const exportMonthlyAnalysis = async (stations: StationMonthly[]): Promise<void> => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Analyse')

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Tag', key: 'day', width: 10 },
    { header: 'Minuten', key: 'minutes', width: 15 }
  ]

  const totalSum = stations.reduce((total, station) => total + station.sum, 0)

  stations.forEach((station) => {
    station.data.forEach((dayData) => {
      worksheet.addRow({
        id: station.id,
        name: station.name,
        day: dayData.day,
        minutes: dayData.minutes
      })
    })

    const summaryRow = worksheet.addRow({
      id: station.id,
      name: `${station.name} - Summe`,
      day: '',
      minutes: station.sum
    })

    summaryRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' }
      }
    })

    worksheet.addRow({})
  })

  const totalRow = worksheet.addRow({
    id: -1,
    name: 'Gesamt',
    day: '',
    minutes: totalSum
  })

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' }
    }
  })

  // Generate the Excel file and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  saveAsExcelFile(buffer, `${getFormattedDate()}_Monatliche_Analyse.xlsx`)
}
