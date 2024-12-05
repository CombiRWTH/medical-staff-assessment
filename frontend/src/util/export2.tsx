import ExcelJS from 'exceljs'

export type StationDaily = {
  id: string,
  name: string,
  minutes: number
}

export type StationMonthly = {
  id: string,
  name: string,
  data: { day: number, minutes: number }[]
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

  stations.forEach((station) => {
    worksheet.addRow({ id: station.id, name: station.name, minutes: station.minutes })
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

  stations.forEach((station) => {
    station.data.forEach((dayData) => {
      worksheet.addRow({
        id: station.id,
        name: station.name,
        day: dayData.day,
        minutes: dayData.minutes
      })
    })
  })

  // Generate the Excel file and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  saveAsExcelFile(buffer, `${getFormattedDate()}_Monatliche_Analyse.xlsx`)
}
