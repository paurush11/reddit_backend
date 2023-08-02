"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230713202845 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230713202845 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" add column "username" text not null, add column "password" text not null;');
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    }
    async down() {
        this.addSql('alter table "user" drop constraint "user_username_unique";');
        this.addSql('alter table "user" drop column "username";');
        this.addSql('alter table "user" drop column "password";');
    }
}
exports.Migration20230713202845 = Migration20230713202845;
//# sourceMappingURL=Migration20230713202845.js.map