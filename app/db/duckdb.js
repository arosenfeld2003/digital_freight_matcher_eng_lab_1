"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.duckDBManager = void 0;
const duckdb_1 = __importDefault(require("duckdb"));
class DuckDBManager {
    constructor() {
        this.db = null;
    }
    static getInstance() {
        if (!DuckDBManager.instance) {
            DuckDBManager.instance = new DuckDBManager;
        }
        return DuckDBManager.instance;
    }
    initDatabase(databasepath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = new duckdb_1.default.Database(databasepath);
                this.db.connect();
                console.log('DuckDB Initialized Successfully.');
            }
            catch (e) {
                console.error('Error initializing DuckB: ', e);
                throw (e);
            }
        });
    }
    getDatabase() {
        return this.db;
    }
}
exports.duckDBManager = DuckDBManager.getInstance();
