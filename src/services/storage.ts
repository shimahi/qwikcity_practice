import type { User } from '@/schemas'
import {
  CopyObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { CopyObjectCommandOutput } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { RequestEventBase } from '@builder.io/qwik-city/middleware/request-handler'
/**
 * @description
 * ファイルストレージサービスを操作するクラス
 * S3のSDKを利用し、ストレージに対してアクセスする
 */
export class StorageService {
  private readonly endpoint
  private readonly publicEndpoint
  private readonly bucket
  private readonly client

  constructor(requestEvent: RequestEventBase<QwikCityPlatform>) {
    this.endpoint = requestEvent.env.get('STORAGE_ENDPOINT') ?? '#'
    this.publicEndpoint =
      requestEvent.env.get('PUBLIC_STORAGE_BUCKET_ENDPOINT') ?? '#'
    this.bucket = requestEvent.env.get('STORAGE_BUCKET_NAME') ?? '#'
    this.client = new S3Client({
      region: 'APAC',
      endpoint: requestEvent.env.get('STORAGE_ENDPOINT') ?? '#',
      credentials: {
        accessKeyId: requestEvent.env.get('STORAGE_ACCESS_KEY_ID') ?? '#',
        secretAccessKey:
          requestEvent.env.get('STORAGE_SECRET_ACCESS_KEY') ?? '#',
      },
    })
  }

  /**
   * ストレージのtmpディレクトリへのアップロード用の署名付きURLを生成する
   * このURLに対してクライアント側でアップロード処理を行うことでファイルをアップロードできる
   * @param {string} tempFileKey tmpディレクトリ内のファイルパス(キー)
   */
  async generateUploadUrl(tmpKey: string) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({ Bucket: this.bucket, Key: tmpKey }),
      {
        expiresIn: 3600,
      },
    )
  }

  /**
   * tmpディレクトリからファイルデータを保存用ディレクトリに移動しそのURLを返す
   * @param tmpKey tmpへのパス
   * @param object ファイルのパスと関連するオブジェクトのデータ
   * @returns originの画像のURL
   */
  async save<T extends keyof StoragePath>({
    tmpKey,
    object,
  }: {
    tmpKey: string
    object: {
      name: T
      field: StoragePath[T]
      id: string
    }
  }): Promise<string> {
    const fileName = tmpKey.split('/').pop()?.split('-').slice(1).join('-')

    if (!fileName) {
      throw new Error('ファイルが見当たりません')
    }

    const uploadKey = `service/${object.name}/${object.id}/${object.field}/${fileName}`
    await this.moveStorageObject({
      key: uploadKey,
      sourceKey: tmpKey,
    })

    return `${this.publicEndpoint}/${uploadKey}`
  }

  /**
   * @private
   * ストレージ上のオブジェクトをフォルダ間移動させる
   * @param key ストレージ上でファイルを一時保存している場所のキー
   * @param sourceKey コピー元オブジェクトのパス（バケット名不要）
   */
  private async moveStorageObject({
    key,
    sourceKey,
  }: {
    key: string
    sourceKey: string
  }): Promise<CopyObjectCommandOutput> {
    return await this.client
      .send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: key,
          CopySource: '/'.concat(this.bucket ?? '', '/', sourceKey),
        }),
      )
      .catch((e) => {
        throw new Error(e)
      })
  }
}

/**
 * @description
 * ストレージ上でサービスドメインに応じた静的パスの名前
 */
type StoragePath = {
  // TODO: 今はavatar,headerをモックしてるので、スキーマの更新にあわせて修正する
  user: keyof Pick<
    User & { avatar: string; header: string },
    'avatar' | 'header'
  >
}
