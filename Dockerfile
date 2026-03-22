FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 100 -i http://mirrors.huaweicloud.com/repository/pypi/simple/ --trusted-host mirrors.huaweicloud.com -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]