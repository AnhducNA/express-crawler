import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'

@Table({ tableName: 'products' })
export default class ProductEntity extends Model<ProductEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number

  @Column(DataType.STRING)
  chatxId: string
  @Column(DataType.STRING)
  url: string
  @Column(DataType.STRING)
  title: string
  @Column(DataType.STRING)
  type: string
  @Column(DataType.NUMBER)
  inventoryQuantity: number
  @Column(DataType.STRING)
  inventoryPolicy: string
  @Column(DataType.STRING)
  sku: string
  @Column(DataType.STRING)
  barcode: string
  @Column(DataType.STRING)
  featuredImage: string
  @Column(DataType.TEXT('medium'))
  images: string
  @Column(DataType.STRING)
  trademark: string
  @Column(DataType.TEXT('medium'))
  shortDescription: string
  @Column(DataType.NUMBER)
  price: number
  @Column(DataType.NUMBER)
  originalPrice: number
  @Column(DataType.STRING)
  percentDiscount: string
  @Column(DataType.TEXT('long'))
  description: string
  @CreatedAt
  @Column
  createdAt!: Date
  @UpdatedAt
  @Column
  updatedAt!: Date
}
