module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", { 
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    contents: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING, // 이미지 URL 저장
      allowNull: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,  // 기본값 0으로 설정
    }
  },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: "user_id", targetKey: "id" });
  };

  return Comment;
};
