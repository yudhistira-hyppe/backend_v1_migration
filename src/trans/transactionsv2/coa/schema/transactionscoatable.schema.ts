import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCoaTableDocument = TransactionsCoaTable & Document;

@Schema({ collection: 'transactionsCoaTable' })
export class TransactionsCoaTable {
    _id: mongoose.Types.ObjectId;
    @Prop()
    coaTransaction: string;
    @Prop()
    kas: number;
    @Prop()
    biayaPaymentGateway: number;
    @Prop()
    biayaDiscount: number;
    @Prop()
    biayaFreeCreator: number;
    @Prop()
    hutangSaldoCoin: number;
    @Prop()
    hutangSaldoCredit: number;
    @Prop()
    pendapatanBiayaTransaction: number;
    @Prop()
    pendapatanPenukaranCoin: number;
    @Prop()
    pendapatanContentOwnership: number;
    @Prop()
    pendapatanContentMarketPlace: number;
    @Prop()
    pendapatanBoostPost: number;
    @Prop()
    pendapatanLiveGift: number;
    @Prop()
    pendapatanContentGift: number;
    @Prop()
    pendapatanAdvertisement: number;
    @Prop()
    pendapatanDiTarik: number;
    @Prop()
    modalDiSetor: number;
    @Prop()
    allProductPendapatan: number;
    @Prop()
    idCoinSettings: mongoose.Types.ObjectId;
    @Prop()
    idTransaction: string;
    @Prop()
    createdAt: string;
    @Prop()
    updatedAt: string;
    @Prop()
    product: mongoose.Types.ObjectId;
    @Prop()
    category: mongoose.Types.ObjectId;
    @Prop()
    status: string;
}
export const TransactionsCoaTableSchema = SchemaFactory.createForClass(TransactionsCoaTable);