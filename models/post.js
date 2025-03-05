module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", { 
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
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
    Post.belongsTo(models.User, { foreignKey: "user_id", targetKey: "user_id" });
  };

  return Post;
};
