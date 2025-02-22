module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", { 
    post_id: {
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
    }
  },
    {
      timestamps: true,
      underscored: true,
    }
  );

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: "user_id", targetKey: "id" });
  };

  return Post;
};
