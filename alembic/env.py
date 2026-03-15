import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import sys
from os.path import dirname, abspath
import os
from dotenv import load_dotenv

# Добавляем путь к проекту для импорта модулей
sys.path.append(dirname(dirname(abspath(__file__))))

# Загружаем переменные окружения из .env
load_dotenv()

# Импортируем Base и модели
from app.database import Base
from app.models import User, Character

# Это объект конфигурации Alembic
config = context.config

# Настройка логирования
fileConfig(config.config_file_name)

# Метаданные для автогенерации
target_metadata = Base.metadata


# Функция для запуска миграций в офлайн-режиме (синхронном)
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# Функция для выполнения миграций с переданным соединением
def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


# Асинхронная функция для запуска миграций онлайн
async def run_async_migrations() -> None:
    # Получаем URL базы из переменной окружения
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL not set in environment")

    # Переопределяем URL в конфиге
    config.set_main_option("sqlalchemy.url", database_url)

    # Создаём асинхронный движок
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# Выбор режима
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()