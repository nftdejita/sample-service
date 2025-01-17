// form/form.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as formJson from '../data/form.json';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(username: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    let profileData;

    if (user) {
      profileData = JSON.parse(user.value); // JSONデータをパースして取得
    } else {
      profileData = { ...formJson }; // form.jsonのコピーを作成
    }

    // usernameフィールドを追加
    profileData.username = username;

    return profileData;
  }

  async updateProfile(username: string, formData: any): Promise<any> {
    // formJsonのコピーを作成し、必要なフィールドのみを更新
    let updatedFields = formJson.fields.map((field) => {
      if (formData[field.id] !== undefined) {
        return { ...field, value: formData[field.id] };
      }
      return field;
    });

    // 【算術例】ageフィールドの値を使ってbirthYearフィールドを更新する
    if (formData.age) {
      updatedFields = updatedFields.map((field) => {
        if (field.id === 'birthYear') {
          return { ...field, value: new Date().getFullYear() - formData.age };
        }
        return field;
      });
    }

    // ヘッダー部分を追加する
    const updatedData = {
      title: formJson.title,
      description: formJson.description,
      username: username,
      fields: updatedFields,
    };

    // ユーザーエンティティを検索または新規作成
    let user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      user = new User();
      user.username = username;
    }

    user.value = JSON.stringify(updatedData);

    await this.userRepository.save(user);
    return { message: 'データが正常に更新されました。' };
  }

  async deleteProfile(username: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      await this.userRepository.remove(user);
      return { message: 'データが正常に削除されました。' };
    } else {
      return { message: '削除対象がありません' };
    }
  }
}
