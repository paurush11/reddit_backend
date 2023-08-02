"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230719034144 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230719034144 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    }
    async down() {
        this.addSql('alter table "user" drop constraint "user_email_unique";');
    }
}
exports.Migration20230719034144 = Migration20230719034144;
//# sourceMappingURL=Migration20230719034144.js.map