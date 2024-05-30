import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionsCoaDocument = TransactionsCoa & Document;

@Schema({ collection: 'transactionsCoa' })
export class TransactionsCoa {
    // _id: mongoose.Types.ObjectId;
    // @Prop()
    // coa: string;
    // @Prop()
    // subCoa: any[];
    // @Prop()
    // createdAt: string;
    // @Prop()
    // updatedAt: string;
    // @Prop()
    // isDelete: boolean;

    _id: mongoose.Types.ObjectId;
    @Prop()
    coaTransaction: string;
    @Prop({ type: Object })
    asset: {
        kas: number,
        biaya: {
            biayaPaymentGateway: number,
            biayaDiscount: number,
            biayaFreeCreator: number
        }
    };
    @Prop({ type: Object })
    hutang: {
        hutangSaldoCoin: number,
        hutangSaldoCredit: number
    };
    @Prop({ type: Object })
    ekuitas: {
        saldoPendapatan: {
            pendapatanBiayaTransaction: number,
            pendapatanPenukaranCoin: number,
            pendapatanContentOwnership: number,
            pendapatanContentMarketPlace: number,
            pendapatanBoostPost: number,
            pendapatanLiveGift: number,
            pendapatanContentGift: number,
            pendapatanAdvertisement: number
        },
        saldoDiTarik: {
            pendapatanDiTarik: number
        }
    };
    @Prop({ type: Object })
    modal: {
        modalDiSetor: number
    };
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
export const TransactionsCoaSchema = SchemaFactory.createForClass(TransactionsCoa);