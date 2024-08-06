/**
 * 指定した文字列を最初の改行、または最大文字数でカットする
 * @param content 対象文字列
 * @param maxLength 最大文字数
 * @param ellipsis 省略記号「...」を末尾に付与するか
 * @param showNextLine 最初の改行以降の文章も表示するか
 */
export const truncate = (
  content: string,
  maxLength = 100,
  ellipsis = true,
  showNextLine = false,
) => {
  // 改行コードで切る
  const newContent = showNextLine ? content : content.split(/\n|\r\n|\r/)[0]
  // 指定文字数まで切る
  const maxStrings = newContent.substring(
    0,
    showNextLine
      ? maxLength + (content.match(/\n|\r\n|\r/g) || []).length
      : maxLength,
  )

  // 省略記号指定があり、truncateされていた場合に「...」を付与
  return ellipsis &&
    ((!showNextLine && content.match(/\n|\r\n|\r/)) ||
      [...content].length > maxLength)
    ? `${maxStrings}…`
    : maxStrings
}

/**
 * オブジェクト配列をcreatedAtの新しい順に並び替える
 * ページネーションのテストなどに用いる
 */
interface ObjectWithCreatedAt {
  createdAt: Date
  [key: string]: any // 他のプロパティも含むためのオプション
}

export function sortByCreatedAt(
  objects: ObjectWithCreatedAt[],
): ObjectWithCreatedAt[] {
  // 新しい順にソートする比較関数
  const compareFunction = (a: ObjectWithCreatedAt, b: ObjectWithCreatedAt) => {
    return b.createdAt.getTime() - a.createdAt.getTime()
  }

  // ソートして新しい配列を返す
  return objects.slice().sort(compareFunction)
}

/**
 * URL・ファイル名の拡張子からMIMEタイプを取得する
 * @param {string} str URL・ファイル名
 */
export function getMimeType(str: string): string {
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    '.xlsx':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    '.pptx':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    xml: 'text/xml',
    js: 'text/javascript',
    json: 'application/json',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    m4a: 'audio/x-m4a',
  }

  const extension = str
    .split('.')
    .slice(-1)[0]
    .toLowerCase() as keyof typeof mimeTypes

  return mimeTypes[extension] || 'application/octet-stream'
}
