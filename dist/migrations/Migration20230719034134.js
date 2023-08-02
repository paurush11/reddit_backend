"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230719034134 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230719034134 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" drop constraint "user_email_unique";');
    }
    async down() {
        this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    }
}
exports.Migration20230719034134 = Migration20230719034134;
//# sourceMappingURL=Migration20230719034134.js.map