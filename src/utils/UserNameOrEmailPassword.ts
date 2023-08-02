import { Field, InputType } from "type-graphql";

@InputType()
export class UserNameOrEmailPassword {
  @Field()
  username!: string;
  @Field()
  email!: string;
  @Field()
  password!: string;
}
